export default function CommentID(RangeA, RangeB) {
    return Math.floor(Math.random() * (RangeB - RangeA + 1) + RangeA);
}