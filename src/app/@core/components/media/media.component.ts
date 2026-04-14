import { Component, inject, input, model } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'myerp-media',
  imports: [],
  templateUrl: './media.component.html',
  styleUrl: './media.component.scss'
})
export class MyMedia {
  /**
   * src:string
   * media:Media
   * height:number | string - Image Height
   * defaultImage:string - Default image to be displayed if the image is not found
   */
  // Using input() from Angular 17+
  src = input<string>("");
  media = model<Media | undefined>(undefined);
  height = input<number | string>(100);
  defaultImage = input<string>("assets/myerp-core/images/no-image.jpg");

  public videoPoster: string | SafeUrl = "";
  
  // Using inject()
  private readonly sanitizer = inject(DomSanitizer);

  ngOnInit() {
    const mediaValue = this.media();
    if (!mediaValue) {
      this.media.set({
        type: "IMAGE",
        url: this.src() || "",
      });
    } else {
      if (mediaValue?.type == "VIDEO") {
        this.generateVideoPoster();
      }
    }
  }

  async generateVideoPoster() {
    await this.captureVideoPoster();

    if (this.videoPoster) {
      this.videoPoster = this.sanitizer.bypassSecurityTrustUrl(this.videoPoster.toString());
    }
  }

  captureVideoPoster() {
    return new Promise((resolve, reject) => {
      try {
        const video: HTMLVideoElement = document.createElement("video")
        video.crossOrigin = "*";
        video.src = this.media()?.url.toString() || "";
        video.preload = 'metadata';
        video.muted = true;
        video.playsInline = true;

        video.play();

        function drawImg() {
          const canvas: HTMLCanvasElement = document.createElement("canvas");
          canvas.width = 1080;
          canvas.height = 720;
          canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imgUrl = canvas.toDataURL();
          return imgUrl;
        }

        function getUrl(imgUrl: string) {
          if (imgUrl.length > 100000) {
            video.removeEventListener('timeupdate', timeupdate);
            video.pause();
            return imgUrl;
          } else {
            return imgUrl;
          }
        }

        const timeupdate = () => {
          const imgUrl = drawImg();
          this.videoPoster = getUrl(imgUrl);
          resolve(true);
        };

        video.addEventListener('timeupdate', timeupdate);

        video.onloadeddata = () => {
          const imgUrl = drawImg();
          this.videoPoster = getUrl(imgUrl);
          resolve(true);
        }

      } catch (err) {
        console.error(err);
        reject(false);
      }
    })
  }

  onImageError(e: any) {
    e.target.src = this.defaultImage();
  }
}

export interface Media {
  type: MediaType;
  url: string | SafeUrl;
  file?: any;
}

type MediaType = 'IMAGE' | 'VIDEO' | 'UNSUPPORTED' | 'FILE';
