import { Prop, toNative } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import "./css/rating.css";

interface RatingDisplayerArgs {
    rating: number;
}

@Component
class RatingDisplayer extends TsxComponent<RatingDisplayerArgs> implements RatingDisplayerArgs {
    @Prop() rating: number;

    render(h) {
        const rating = this.rating > 0 ? this.rating : 1;
        const arr = [];

        while (arr.length < rating) {
            arr.push(arr.length);
        }

        return (
            <span class="rating-wrapper">
                {arr.map((p) => (
                    <i class="rating-item rating-star fas fa-star"></i>
                ))}
            </span>
        );
    }
}

export default toNative(RatingDisplayer);
