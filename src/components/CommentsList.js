import React from "react";
import colorIndex from '../uData'

const CommentsList = ({comments}) => {
 return(
        <>
    {(() => {
const rows = [];
for (let i = 0; i < comments.length; i++) {
    for (let j = 0; j < colorIndex.length; j++) {
        if(comments[i].user === colorIndex[j].id){
  rows.push(<li key={i} className="liCommentElem">
  <p className="iconeComment" style={{backgroundColor :colorIndex[j].color, color :"#fff"}}>{colorIndex[j].name.charAt(0)}</p>
  <p className="textComment">{comments[i].text}</p>
  </li>);
        }
    }
}
return rows;
      })()}
      </>
    );
};
export default CommentsList;
