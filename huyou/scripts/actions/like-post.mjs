import {prepareAction,performAction} from './common.mjs';
export const prepareLikePost=options=>prepareAction('like-post',options);
export const likePost=options=>performAction('like-post',options);
