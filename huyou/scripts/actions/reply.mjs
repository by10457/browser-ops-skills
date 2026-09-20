import {prepareAction,performAction} from './common.mjs';
export const prepareReply=options=>prepareAction('reply',options);
export const reply=options=>performAction('reply',options);
