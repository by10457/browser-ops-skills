import {prepareAction,performAction} from './common.mjs';
export const prepareLikeComment=options=>prepareAction('like-comment',options);
export const likeComment=options=>performAction('like-comment',options);
