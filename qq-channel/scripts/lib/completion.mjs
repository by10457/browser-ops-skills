// Navigation is a follow-up to a confirmed write, never a reason to repeat it.
export async function finishPublishedPost(plan,result,returnToChannel){
 if(plan.task.action!=='publish'||result.status!=='verified-ui')return result;
 try{return {...result,returnToChannel:{status:'returned',result:await returnToChannel()}};}
 catch(e){return {...result,returnToChannel:{status:'failed',code:e.code||'RETURN_FAILED',message:e.message},warnings:[...(result.warnings||[]),'帖子已发布；返回频道失败，不要重新发布']};}
}
