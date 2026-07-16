export default interface User {
  id: string;
  name?: string;
  email: string;
  enable: boolean;
  updatedAt?: string;
  createdAt?: string;
  provider: string;

  roles: {
    id: number;
    name: string;
  }[];
}