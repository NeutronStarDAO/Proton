import Hash "mo:base/Hash";
import Nat "mo:base/Nat";
import TrieMap "mo:base/TrieMap";
import Principal "mo:base/Principal";
import Types "./types";
import Bucket "./bucket";
import Iter "mo:base/Iter";
import Cycles "mo:base/ExperimentalCycles";
import Time "mo:base/Time";
import Int "mo:base/Int";
import Option "mo:base/Option";
import IC "mo:ic";

actor class RootPost(
    _commentFetchCanister: Principal,
    _likeFetchCanister: Principal
) = this {

    stable let T_CYCLES = 1_000_000_000_000;
    stable let BUCKET_MAX_POST_NUMBER: Nat = 5000; // 每个Bucket可以存储的最大帖子数 (待计算)
    stable var bucketIndex: Nat = 0;

    stable var bucketsEntries: [(Nat, Principal)] = [];
    let buckets = TrieMap.fromEntries<Nat, Principal>(bucketsEntries.vals(), Nat.equal, Hash.hash);

    stable var availableBucketsEntries: [(Nat, Principal)] = [];
    let availableBuckets = TrieMap.fromEntries<Nat, Principal>(availableBucketsEntries.vals(), Nat.equal, Hash.hash);

    stable var unavailableBucketsEntries: [(Nat, Principal)] = [];
    let unavailableBuckets = TrieMap.fromEntries<Nat, Principal>(unavailableBucketsEntries.vals(), Nat.equal, Hash.hash);

    // 开始先创建 5 个 Bucket
    public shared({caller}) func init(): async () {
        var i = 0;
        label l loop {
            if(i >= 5) break l;

            Cycles.add(4 * T_CYCLES);
            let newBucket = await Bucket.Bucket(
                Principal.fromActor(this),
                commentFetchCanister,
                likeFetchCanister
            );

            buckets.put(bucketIndex, Principal.fromActor(newBucket));
            availableBuckets.put(bucketIndex, Principal.fromActor(newBucket));
            bucketIndex += 1;

            i += 1;
        };
    };

    public shared({caller}) func addAvailBucket(bucketArray: [Principal]): async () {
        for(_bucket in bucketArray.vals()) {
            buckets.put(bucketIndex, _bucket);
            availableBuckets.put(bucketIndex, _bucket);
            bucketIndex += 1;
        };
    };

    // let ic: IC.Service = actor("aaaaa-aa");
    // public shared({caller}) func updateSettings(bucketArray: [Principal]): async () {
    //     for(_bucket in bucketArray.vals()) {
    //         await ic.update_settings({
    //             canister_id = _bucket;
    //             settings = {
    //                 freezing_threshold = null;
    //                 // controllers = ?[Principal.fromActor(this), caller, feedCanisterId];
    //                 controllers = ?[Principal.fromActor(this), Principal.fromText("fcvlw-g3pmj-ccerf-c4mt2-pwutp-wnwsd-i7c22-dt23k-k3eof-er7nb-5qe")];
    //                 memory_allocation = null;
    //                 compute_allocation = null;
    //             }
    //         });
    //     }
    // };

    // 创建Bucket
    public shared({caller}) func createBucket(): async Principal {
        await _createBucket()
    };

    private func _createBucket(): async Principal {
        Cycles.add(4 * T_CYCLES);
        let newBucket = await Bucket.Bucket(
            Principal.fromActor(this),
            commentFetchCanister,
            likeFetchCanister
        );

        buckets.put(bucketIndex, Principal.fromActor(newBucket));
        availableBuckets.put(bucketIndex, Principal.fromActor(newBucket));

        bucketIndex += 1;

        Principal.fromActor(newBucket)
    };

    public shared({caller}) func reCreateBucket(): async () {
        for((_key, _bucket) in availableBuckets.entries()) {
            if(_bucket == caller) {
                ignore await _createBucket();
                availableBuckets.delete(_key);
                unavailableBuckets.put(_key, _bucket);
            };
        };
    };    

    // 查询可用的Bucket
    public query func getAvailableBucket(): async ?Principal {
        if(availableBuckets.size() == 0) return null;
        availableBuckets.get(Nat.rem(Option.unwrap(Nat.fromText(Int.toText(Time.now()))), availableBuckets.size()))
    };

    // 查询所有的Bucket
    public query func getAllBuckets(): async [Principal] {
        Iter.toArray(buckets.vals())
    };

    public query func getAllAvailableBuckets(): async [Principal] {
        Iter.toArray(availableBuckets.vals())
    };

    // 查询已经存满的Bucket
    public query func getAllUnavailableBuckets(): async [Principal] {
        Iter.toArray(unavailableBuckets.vals())
    };

// CommentFetchCanister

    stable var commentFetchCanister = _commentFetchCanister;
    
    public query func getCommentFetchCanister(): async Principal { commentFetchCanister };

    public shared({caller}) func updateCommentFetchCanister(
        newCommentFetchCanister: Principal
    ): async () {
        commentFetchCanister := commentFetchCanister;
    };


// LikeFetchCanister

    stable var likeFetchCanister = _likeFetchCanister;
    
    public query func getLikeFetchCanister(): async Principal { likeFetchCanister };

    public shared({caller}) func updateLikeFetchCanister(
        newLikeFetchCanister: Principal
    ): async () {
        likeFetchCanister := newLikeFetchCanister;
    };

    system func preupgrade() {
        bucketsEntries := Iter.toArray(buckets.entries());
        availableBucketsEntries := Iter.toArray(availableBuckets.entries());
        unavailableBucketsEntries := Iter.toArray(unavailableBuckets.entries());
    };

    system func postupgrade() {
        bucketsEntries := [];
        availableBucketsEntries := [];
        unavailableBucketsEntries := [];
    };
}