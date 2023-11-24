import Hash "mo:base/Hash";
import Nat "mo:base/Nat";
import TrieMap "mo:base/TrieMap";
import Principal "mo:base/Principal";
import Types "./types";
import Bucket "./bucket";
import Iter "mo:base/Iter";

actor class RootPost(
    _commentFetchCanister: Principal,
    _likeFetchCanister: Principal
) = this {

    type BucketInfo = Types.BucketInfo;
    type BucketInfoImmutable = Types.BucketInfoImmutable;

    stable let BUCKET_MAX_POST_NUMBER: Nat = 5000; // 每个Bucket可以存储的最大帖子数 (待计算)
    stable var bucketIndex: Nat = 0;

    let buckets = TrieMap.TrieMap<Nat, BucketInfo>(Nat.equal, Hash.hash);
    let availableBuckets = TrieMap.TrieMap<Nat, BucketInfo>(Nat.equal, Hash.hash);
    let unavailableBuckets = TrieMap.TrieMap<Nat, BucketInfo>(Nat.equal, Hash.hash);

    // 开始先创建 5 个 Bucket
    public shared({caller}) func init(): async () {
        var i = 0;
        label l loop {
            if(i >= 5) break l;

            let newBucket = await Bucket.Bucket(
                commentFetchCanister,
                likeFetchCanister
            );
            let bucketInfo: BucketInfo = {
                index = bucketIndex;
                canisterId = Principal.fromActor(newBucket);
                var postNumber = 0;
            };

            buckets.put(bucketIndex, bucketInfo);
            availableBuckets.put(bucketIndex, bucketInfo);
            bucketIndex += 1;

            i += 1;
        };
    };

    // 创建Bucket
    public shared({caller}) func createBucket(): async Principal {
        let newBucket = await Bucket.Bucket(
            commentFetchCanister,
            likeFetchCanister
        );
        let bucketInfo: BucketInfo = {
            index = bucketIndex;
            canisterId = Principal.fromActor(newBucket);
            var postNumber = 0;
        };

        buckets.put(bucketIndex, bucketInfo);
        availableBuckets.put(bucketIndex, bucketInfo);

        bucketIndex += 1;
        bucketInfo.canisterId
    };

    // 检查状态，如果存满则新建Bucket
    public shared func checkBucket(): async () {
        let avalBucketsVals = availableBuckets.vals();
        for(bucket in avalBucketsVals) {
            if(bucket.postNumber >= BUCKET_MAX_POST_NUMBER) {
                availableBuckets.delete(bucket.index);
                unavailableBuckets.put(bucket.index, bucket);
                ignore createBucket(); // 不等待结果
            };
        };
    };

    // 查询可用的Bucket
    public query func getAvailableBucket(): async ?BucketInfoImmutable {
        for(bucket in availableBuckets.vals()) {
            if(bucket.postNumber < BUCKET_MAX_POST_NUMBER) {
                return ?{
                    index = bucket.index;
                    canisterId = bucket.canisterId;
                    postNumber = bucket.postNumber;
                };
            };
        };
        null
    };

    // 查询所有的Bucket
    public query func getAllBuckets(): async [BucketInfoImmutable] {
        Iter.toArray(
            Iter.map(
            buckets.vals(),
            func (x: BucketInfo): BucketInfoImmutable {
                {
                    index = x.index;
                    canisterId = x.canisterId;
                    postNumber = x.postNumber;
                }
            }))
    };

    // 查询已经存满的Bucket
    public query func getUnavailableBuckets(): async [BucketInfoImmutable] {
        Iter.toArray(
            Iter.map(
            unavailableBuckets.vals(),
            func (x: BucketInfo): BucketInfoImmutable {
                {
                    index = x.index;
                    canisterId = x.canisterId;
                    postNumber = x.postNumber;
                }
            }))   
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

    };

    system func postupgrade() {

    };

}