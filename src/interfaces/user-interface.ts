import User from "../database/models/user.model";

export interface IUser {
  email: string;
  bio?: string;
  image?: string;
  following: User[];
  dob: string,
  fullName: string,
  mobileNumber: string
  wallet: walletDetails,
  panCardImage: string,
  firebaseToken: string
}

export interface walletDetails {
  balance: number,
  currency: string,
  platform: string,
  additionalData: object
}

export interface IProfile {
  bio: string;
  image: string;
  following: boolean;
}
