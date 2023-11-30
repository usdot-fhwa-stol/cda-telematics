export const env = {...process.env, ...window['env']}
export const URL_Web_Server_Prefix = process.env.NODE_ENV === "production" ? env.REACT_APP_WEB_SERVER_URI: process.env.REACT_APP_WEB_SERVER_URI;
export const URL_Web_Messaging_Server_Prefix = process.env.NODE_ENV === "production" ? env.REACT_APP_MESSAGING_SERVER_URI: process.env.REACT_APP_MESSAGING_SERVER_URI;
export const URL_GRAFANA_Prefix = process.env.NODE_ENV === "production" ? env.REACT_APP_GRAFANA_URI: process.env.REACT_APP_GRAFANA_URI;