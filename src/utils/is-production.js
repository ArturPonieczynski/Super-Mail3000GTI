import {config} from '../config.js';

const {APP_ENV} = config;

export const isProductionYesNo = (envVariable, developVariable) => {
return  APP_ENV === 'production' ? config[envVariable] : developVariable;
}
