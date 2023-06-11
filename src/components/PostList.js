import React from "react";
import noImg from "../assets/no-picture-available.png"

const PostList = ({ movies, deleteMovie, getMovie, handlePoster, updateRating }) => {
  return (
    <ul className="ulElem">
      {movies.map((t) => (
<li className="liElem" key={t.id}>
<div className="listInfos">
  <div className="titleAndRating">
      <span className="textTitle" style={{backgroundColor :t.color}}>
        {t.title}
      </span>
      <span className={t.time==='new'?"textTime":t.time==='recent'?"textTime2":"textTime3"}>
        {t.time}
      </span>
      <span className="textRatingH">
        {t.rating}<button className="starButton" onClick={() => updateRating(t.id, t.rating)}></button>
      </span>
      </div>
      <span className="textDescr">
      <img className="imgDesc" src={t.imgUrl?t.imgUrl:{noImg}}/><span className="textDesc">{t.description}</span>
      </span>
      </div>
      <div className="listButtons">
      <button className="whoButton" onClick={() => handlePoster(t.poster)}></button>
      <button className="editButton" onClick={() => getMovie(t.id)}></button>
      <button className="deleteButton" onClick={() => deleteMovie(t.id)}></button>
      </div>
</li>
      ))}
    </ul>
  );
};

export default PostList;