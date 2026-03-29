import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  type UserProfile = {
    name : Text;
    username : Text;
    role : Text;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
  };

  public func run(_old : {}) : NewActor {
    { userProfiles = Map.empty<Principal, UserProfile>() };
  };
};
