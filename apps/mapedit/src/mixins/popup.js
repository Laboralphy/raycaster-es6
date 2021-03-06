import * as MUTATION from '../store/modules/editor/mutation-types';
import {createNamespacedHelpers} from "vuex";
const {mapMutations: popupMutations} = createNamespacedHelpers('editor');



const PopupMixin = {
    methods: {
        ...popupMutations({
            showPopup: MUTATION.SHOW_POPUP,
            hidePopup: MUTATION.HIDE_POPUP,
            setPopupType: MUTATION.SET_POPUP_TYPE,
            setPopupContent: MUTATION.SET_POPUP_CONTENT,
            setPopupProgress: MUTATION.SET_POPUP_PROGRESS
        })
    }
};

export default PopupMixin;