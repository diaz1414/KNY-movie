import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ykn.app',
  appName: 'Yuk Kita Nonton',
  webDir: 'dist',
  server: {
    url: 'https://yknmovies.diaww.my.id',
    cleartext: true,
    androidScheme: 'https',
    allowNavigation: [
      'yknmovies.diaww.my.id',
      'vidsrc.me',
      'vidsrc.to',
      'vidsrc.xyz',
      'vidsrc.cc',
      '*.vidsrc.me',
      '*.vidsrc.to',
      '*.vidsrc.xyz'
    ]
  },
  android: {
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
