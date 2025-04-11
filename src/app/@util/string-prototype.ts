declare global {
    interface String {
        capitalize(): string;
    }
}

// Define the capitalize method
String.prototype.capitalize = function (): string {
    return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
};

export { }