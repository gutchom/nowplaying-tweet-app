import ElectronStore from 'electron-store';

type StoreType = {
  accounts: Account[];
  config: {
    [userId: string]: Config;
  };
};

type Account = {
  userId: string;
  screenName: string;
  accessToken: string;
  accessSecret: string;
};

type Config = {
  userId: string;
  template: string;
};

export const store = new ElectronStore<StoreType>();
