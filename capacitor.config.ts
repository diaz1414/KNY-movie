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
      '*.diaww.my.id',
      'vidsrc.me',
      'vidsrc.to',
      'vidsrc.xyz',
      'vidsrc.cc',
      'vidsrc.in',
      'vidsrc.stream',
      'vidlink.pro',
      'autoembed.co',
      'multiembed.mov',
      'warezcdn.com',
      'nontongo.win',
      '2embed.cc',
      'cloudnestra.com',
      '*.vidsrc.me',
      '*.vidsrc.to',
      '*.vidsrc.xyz',
      '*.vidsrc.cc',
      '*.vidsrc.in',
      '*.vidsrc.stream',
      '*.vidlink.pro',
      '*.autoembed.co',
      '*.multiembed.mov',
      '*.warezcdn.com',
      '*.nontongo.win',
      '*.2embed.cc',
      '*.cloudnestra.com'
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
