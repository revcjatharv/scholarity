import User from "../database/models/user.model";

export interface IUser {
  email: string;
  username: string;
  bio?: string;
  image?: string;
  following: User[];
  dob: string,
  fullName: string,
  mobileNumber: string
  wallet: walletDetails,
  panCardImage: string,
}

export interface walletDetails {
  balance: number,
  currency: string,
  platform: string,
  additionalData: object
}

export interface IProfile {
  username: string;
  bio: string;
  image: string;
  following: boolean;
}
