import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ykn.app',
  appName: 'Yuk Kita Nonton',
  webDir: 'dist',
  server: {
    cleartext: true,
    allowNavigation: [
      'yknmovies.diaww.my.id',
      '*.diaww.my.id',
      'vidsrc.me',
      'vidsrc.to',
      'vidsrc.xyz',
      'vidsrc.cc',
      '*.vidsrc.me',
      '*.vidsrc.to',
      '*.vidsrc.xyz',
      '*.vidsrc.cc',
      'vidsrc.in',
      '*.vidsrc.in'
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
