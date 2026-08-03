import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ykn.app',
  appName: 'Yuk Kita Nonton',
  webDir: 'dist',
  server: {
    cleartext: true,
    hostname: 'movies.ykn.my.id',
    androidScheme: 'https',
    allowNavigation: [
      'movies.ykn.my.id',
      '*.movies.ykn.my.id',
      '*.ykn.my.id'
    ]
  },
  android: {
    allowMixedContent: true,
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
      releaseType: 'AAB',
    }
  }
};

export default config;
