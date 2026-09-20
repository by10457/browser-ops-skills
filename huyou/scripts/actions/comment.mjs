import {prepareAction,performAction} from './common.mjs';
export const prepareComment=options=>prepareAction('comment',options);
export const comment=options=>performAction('comment',options);
