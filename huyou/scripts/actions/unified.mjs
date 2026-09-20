import {prepareAction,performAction} from './common.mjs';
export function prepareInteraction(options){const {action,...rest}=options;return prepareAction(action,rest);}
export function executeInteraction(options){return performAction(options.plan?.task?.action,options);}
