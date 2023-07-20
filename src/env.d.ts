namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production';

    // Discord
    TOKEN: string;
    CLIENT_ID: string;
    GUILD_ID: string;
  }
}
