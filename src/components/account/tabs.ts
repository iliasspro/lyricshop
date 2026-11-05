export const ACCOUNT_TABS = ["overview", "orders", "designs", "wishlist", "following"] as const;
export type AccountTab = (typeof ACCOUNT_TABS)[number];

export const tabHref = (tab: AccountTab) => (tab === "overview" ? "/account" : `/account?tab=${tab}`);
