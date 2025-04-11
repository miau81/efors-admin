import dayjs from "dayjs";
import { dbName } from "../databases";
import { BadRequestException } from "../exceptions/BadRequestException";
import { UnauthorizedException } from "../exceptions/UnauthorizedException";
import { ConnectionAction } from "../interfaces/api.db.interface";
import { EntityService } from "./entity.service";
import { JWTService } from "./jwt.service";


const db = dbName;
export class ApiUserService {

    // private convertUtil = new ConvertUtil();
    // private miscUtil = new MiscUtil();
    private jwtService = new JWTService();
    private entityService = new EntityService();
    // private globalService = new GlobalService();
    // private emailService = new EmailService();
    // private fileService = new FileService();

    async login(body: any, isAdmin: boolean, mysqlConn: ConnectionAction): Promise<any> {

        if (!body.loginId || !body.password) {
            throw new BadRequestException("[loginId] and [password] is required!", "REQUIRED_FIELD");
        }

        let where = `WHERE u.id='${body.loginId}'`;

        const user = await mysqlConn.querySingle(`SELECT u.* FROM ${db}.user as u ${where}`);

        if (!user) {
            throw new UnauthorizedException("Invalid loginId or password", "INVALID_ID_PASSWORD");
        }
        if (!user.isActive) {
            throw new UnauthorizedException("Your account has been frozen!", "ACCOUNT_INACTIVE");
        }

        const f = await this.jwtService.comparePassword(body.password, user.password);

        if (!f) {
            throw new UnauthorizedException("Invalid password!", "INVALID_PASSWORD");
        }
        delete user.password;

        const tokens = this.jwtService.sign(user.id);

        const loginDateTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
        await mysqlConn.query(`UPDATE ${db}.user SET lastLoginOn='${loginDateTime}'`);

        user.lastLoginOn = new Date(loginDateTime);

        return { user: user, ...tokens };
    }

    // async firebaseLogin(body: any, company: any): Promise<any> {
    //     // // res.send(admin.apps)
    //     // let fireService: any
    //     // let fireUser: any
    //     // try {
    //     //     fireService = firebaseAdmin.app(company.code.toUpperCase())
    //     // } catch (error: any) {
    //     //     throw new BadRequestError(`No firebase login support for company [code]:${company.code}`)
    //     // }
    //     // try {
    //     //     fireUser = await fireService.auth().verifyIdToken(body.firebaseToken)

    //     // } catch (error: any) {
    //     //     throw new UnauthorizeError(`Invalid firebase token or token has been expired`)
    //     // }
    //     // let where = `WHERE firebaseId='${fireUser.uid}' AND userType='${UserType.CUSTOMER}' AND companyId=${company.id}`
    //     // let user = await this.entityRepository.get({ tableName: "user", sqlWhere: where, selectFields: "*" })
    //     // if (user?.length == 0) {
    //     //     throw new NoDataError("No user found!")
    //     // }
    //     // if (user[0].active == false) {
    //     //     throw new UnauthorizeError("Your account has been frozen!")
    //     // }
    //     // let token = JWTAuth.sign(user[0].id, user[0].email)
    //     // return { id: user[0].id, token }
    // }

    // async register(params: ApiParam, mysqlConn: ConnectionAction): Promise<any> {
    //     let password = params.requestBody.password;
    //     if (password) {
    //         password = await this.jwtService.hashPassword(password);
    //     } else {
    //         password = await this.jwtService.hashPassword(crypto.randomBytes(8).toString("hex"));
    //     }
    //     params.requestBody.password = password;
    //     delete params.requestBody.adminType;
    //     delete params.requestBody.adminAccess;
    //     delete params.requestBody.isDeleted;
    //     delete params.requestBody.id;
    //     const data = await this.globalService.create(params, mysqlConn);
    //     //TODO: send Email
    //     const token = this.jwtService.sign(data.id, data.email);
    //     return { id: data.id, token };
    // }

    // async saveProfile(params: ApiParam, mysqlConn: ConnectionAction): Promise<any> {
    //     let password = params.requestBody.password;
    //     if (password) {
    //         password = await this.jwtService.hashPassword(password);
    //     } else {
    //         password = await this.jwtService.hashPassword(crypto.randomBytes(8).toString("hex"));
    //     }
    //     params.requestBody.password=password;
    //     delete params.requestBody.adminType;
    //     delete params.requestBody.adminAccess;
    //     delete params.requestBody.isDeleted;
    //     delete params.requestBody.id;
    //     const data = await this.globalService.update(params, mysqlConn);
    // }

    async changePassword(body: any, user: any, mysqlConn: ConnectionAction): Promise<void> {
        if (!body.currentPassword && !body.newPassword) {
            throw new BadRequestException("Current password and new password is reuired.", "REQUIRED_FIELD");
        }
        if (await this.jwtService.comparePassword(body.currentPassword, user.password)) {
            let newPassword = await this.jwtService.hashPassword(body.newPassword);
            await this.entityService.save("user", { password: newPassword, id: user.id }, mysqlConn);
            // await this.entityService.update("user", `password='${newPassword}'`, `WHERE id=${user.id}`, mysqlConn);
        } else {
            throw new BadRequestException("Current password not match.", "INCORRECT_CURRENT_PASSWORD");
        }
        return;
    }

    async refreshToken(user: any): Promise<any> {
        return this.jwtService.sign(user.id);
    }

    // async forgotPassword(body: any, isAdmin: boolean, language: string, mysqlConn: ConnectionAction): Promise<any> {
    //     if (!body.email || !body.resetPageUrl) {
    //         throw new BadRequestException("Registered email and body.reset page url are reuired.", "REQUIRED_FIELD");
    //     }

    //     let where = `WHERE u.email='${body.email}' AND u.isDeleted<>1`;
    //     if (isAdmin) {
    //         where = `INNER JOIN ${db}.user_level AS l on u.userLevel=l.code ${where} AND l.adminAccess=true`;
    //     }
    //     const user: any = await mysqlConn.querySingle(`SELECT u.* FROM ${db}.user as u ${where}`);
    //     if (!user) {
    //         throw new NoDataException(`No account found with this email: ${body.email}`, "NO_ACCOUNT_FOUND");
    //     }
    //     if (!user.isActive) {
    //         throw new UnauthorizedException("Your account has been frozen!", "ACCOUNT_INACTIVE");
    //     }

    //     const resetLink = await this.generateForgotPasswordToken(user, body.resetPageUrl, mysqlConn);

    //     const data = {
    //         nickname: user.nickname,
    //         resetLink: resetLink
    //     }
    //     //send email
    //     this.emailService.sendEmail(user.email, "FORGOT_EMAIL", language, mysqlConn, data);
    //     return;
    // }

    // async resetPassword(body: any, mysqlConn: ConnectionAction): Promise<void> {
    //     if (!body.verifyCode && !body.newPassword) {
    //         throw new BadRequestException("Validatation code and new password is reuired.", "REQUIRED_FIELD");
    //     }
    //     const currentDate = new Date();
    //     const where = [currentDate, body.verifyCode];
    //     const reset: any = mysqlConn.querySingle(`SELECT * FROM ${db}.user_reset_password WHERE  expiredOn>=? AND token=?`, where);
    //     if (reset) {
    //         let newPassword = await this.jwtService.hashPassword(body.newPassword);
    //         await mysqlConn.query(`UPDATE ${db}.user SET password='${newPassword} WHERE id=${reset.userId}'`);
    //     } else {
    //         throw new BadRequestException("Validatation code is expired or not match.", "EXPIRED_OR_NOT_MATCH");
    //     }
    //     return;
    // }

    // async uploadProfile(type: "profile" | "banner", files: any, user: any, mysqlConn: ConnectionAction): Promise<any> {
    //     const fileConfig: FileUpladConfig = {
    //         files: files,
    //         fileType: type,
    //         limit: 1,
    //         overwrite: false,
    //         savePath: `/AUTH/${user.id}/PROFILE`
    //     }
    //     const res = await this.fileService.saveFile(fileConfig);
    //     const url = res[0].url;
    //     const field: string = type == 'banner' ? "profileBanner" : "profilePicture";
    //     await mysqlConn.query(`UPDATE ${db}.user SET ${field}='${url}' WHERE id=${user.id}`);
    //     return res[0];
    // }

    // private async generateForgotPasswordToken(user: any, url: string, mysqlConn: ConnectionAction): Promise<string> {
    //     const reset = await mysqlConn.querySingle(`SELECT * FROM user_reset_password WHERE userId=${user.id}`);
    //     const resetId = reset?.id;
    //     const resetToken = this.miscUtil.randomUnique();
    //     const expiryOn = new Date(new Date().getTime() + 15 * 60000);
    //     const resetLink = `${url}?token=${resetToken}`;
    //     const data = {
    //         id: resetId,
    //         createdDate: new Date(),
    //         createdBy: user.id,
    //         token: resetToken,
    //         expiryOn: expiryOn,
    //         resetLink: resetLink,
    //         userId: user.id
    //     }
    //     await this.entityService.save("user_reset_password", data, mysqlConn);

    //     return resetLink;
    // }



}