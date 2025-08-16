// eslint-disable-next-line @typescript-eslint/no-unused-vars
export {};
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}