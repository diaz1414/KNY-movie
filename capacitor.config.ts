import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ykn.app',
  appName: 'Yuk Kita Nonton',
  webDir: 'dist',
  server: {
    cleartext: true,
    hostname: 'id.yknmovies.diaww.my.id',
    androidScheme: 'https',
    allowNavigation: [
      'yknmovies.diaww.my.id',
      'id.yknmovies.diaww.my.id',
      '*.diaww.my.id'
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
