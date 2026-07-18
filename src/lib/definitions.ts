export type FormState =
  | {
      errors?: {
        fullName?: string[];
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

export type Group = {
  id: string;
  name: string;
  description: string | null;
  avatarUrl: string | null;
  createdBy: string;
  createdAt: Date;
};

export type GroupMember = {
  id: string;
  groupId: string;
  userId: string;
  role: string;
  joinedAt: Date;
};

export type Message = {
  id: string;
  groupId: string;
  userId: string;
  content: string;
  createdAt: Date;
};

export type User = {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
};

export type MessageWithUser = Message & {
  user: User;
};

export type GroupWithMembers = Group & {
  members: (GroupMember & { user: User })[];
  lastMessage?: MessageWithUser | null;
  unreadCount?: number;
};
