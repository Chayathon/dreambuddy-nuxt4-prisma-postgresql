export interface OAuthTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
}

export interface OAuthUserInfo {
    id: string;
    name: string;
    email: string;
    picture: string;
}
