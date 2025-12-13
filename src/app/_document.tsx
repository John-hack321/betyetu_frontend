import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/x-icon" href="/icons/favicon.ico" />
        <meta name="theme-color" content="#23313D" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
