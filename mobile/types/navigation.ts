/**
 * Navigation types for type-safe routing in the admin dashboard
 */

export type AdminStackParamList = {
  '(tabs)': undefined;
  'product/new': undefined;
  'product/[id]': { id: string };
  'order/[id]': { id: string };
  'message/[threadId]': { threadId: string };
  'moderation/index': undefined;
  'moderation/reports': undefined;
  'moderation/reviews': undefined;
  'moderation/tickets': undefined;
  'users/index': undefined;
  'users/[id]': { id: string };
  'finance/refunds': undefined;
};

export type TabParamList = {
  products: undefined;
  orders: undefined;
  messages: undefined;
  finance: undefined;
};
