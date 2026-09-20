import {prepareAction,performAction} from './common.mjs';
export const preparePublish=options=>prepareAction('publish',options);
export const publish=options=>performAction('publish',options);
