import "../styles/matchcard.css"; 
const PendingRequestCard = ({ request, onAccept, onReject, onViewProfile }) => {
  const user = request.requester;

  return (
    <div className="match-card">
      <div className="match-top">
        <img
          className="match-avatar"
          src={user.avatar || "https://via.placeholder.com/150"}
          alt="profile"
        />

        <div className="match-basic">
          <h3>
            {user.full_name}, {user.age}
          </h3>

          <p className="match-location">📍 {user.location}</p>
        </div>
      </div>

      <div className="match-actions">
        <button className="btn-primary" onClick={() => onAccept(request._id)}>
          Accept
        </button>

        <button className="btn-secondary" onClick={() => onViewProfile(user._id)}>
          View Profile
        </button>

        <button className="btn-skip" onClick={() => onReject(request._id)}>
          Reject
        </button>
      </div>
    </div>
  );
};

export default PendingRequestCard;