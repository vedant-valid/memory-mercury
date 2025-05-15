function DetailCard({ card, handleCardClick }) {
    const matched = card.matched ? 'matched match-animation' : '';
    const flipped = card.flipped ? 'flipped' : '';
  
    return (
      <div className={`Detail-card ${matched} ${flipped}`} onClick={() => handleCardClick(card)}>
        <div
          className="Detail-card-front"
          style={{ backgroundImage: card.illusPathName ? `url(/illustrations/${card.illusPathName})` : null }}
        ></div>
        <div className="Detail-card-back"></div>
      </div>
    );
  }
  
  export default DetailCard;
  