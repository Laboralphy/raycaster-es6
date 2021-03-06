<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
    <Window
            caption="Tools & Utilities"
    >
        <template v-slot:toolbar>
        </template>

        <div>
            <h3>Map shifting</h3>
            <p>Shifts the entire map on the grid by one cell up, left, right or down. Cells that are shift out from one side of the grid, reappear to the opposite side.</p>
            <label><input v-model="modelUseRegion" type="checkbox" />Only shift cells *inside* the selected region.</label>
            <div class="shiftpad">
                <table>
                    <tr>
                        <td></td>
                        <td>
                            <MyButton @click="doShiftGrid('n')">
                                <ArrowUpThickIcon decorative></ArrowUpThickIcon>
                            </MyButton>
                        </td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>
                            <MyButton @click="doShiftGrid('w')">
                                <ArrowLeftThickIcon decorative></ArrowLeftThickIcon>
                            </MyButton>
                        </td>
                        <td></td>
                        <td>
                            <MyButton @click="doShiftGrid('e')">
                                <ArrowRightThickIcon decorative></ArrowRightThickIcon>
                            </MyButton>
                        </td>
                    </tr>
                    <tr>
                        <td></td>
                        <td>
                            <MyButton @click="doShiftGrid('s')">
                                <ArrowDownThickIcon decorative></ArrowDownThickIcon>
                            </MyButton>
                        </td>
                        <td></td>
                    </tr>
                </table>
            </div>
        </div>
        <div>
            <h3>Level storage usage</h3>
          <p>The level and all its assets occupy <b>{{ getUsage100 }}%</b> of the maximum allowed size.</p>
        </div>
    </Window>
</template>

<script>
    import * as LEVEL_ACTIONS from '../store/modules/level/action-types';
    import * as EDITOR_ACTIONS from '../store/modules/editor/action-types';
    import * as EDITOR_MUTATIONS from '../store/modules/editor/mutation-types';
    import {createNamespacedHelpers} from 'vuex';

    import Window from "./Window.vue";
    import MyButton from "./MyButton.vue";
    import ArrowLeftThickIcon from "vue-material-design-icons/ArrowLeftThick.vue";
    import ArrowRightThickIcon from "vue-material-design-icons/ArrowRightThick.vue";
    import ArrowUpThickIcon from "vue-material-design-icons/ArrowUpThick.vue";
    import ArrowDownThickIcon from "vue-material-design-icons/ArrowDownThick.vue";

    const {mapActions: levelActions, mapGetters: levelGetters} = createNamespacedHelpers('level');
    const {mapActions: editorActions, mapGetters: editorGetters, mapMutations: editorMutations} = createNamespacedHelpers('editor');

    export default {
        name: "UtilPanel",
        components: {
            ArrowDownThickIcon,
            ArrowUpThickIcon,
            ArrowRightThickIcon,
            ArrowLeftThickIcon,
            MyButton,
            Window
        },

        computed: {
          ...levelGetters([
              'getLevelStorageUsage'
          ]),
          ...editorGetters([
              'getUtilPanelUseRegion'
          ]),

          modelUseRegion: {
            get: function() {
              return this.getUtilPanelUseRegion;
            },
            set: function(value) {
              this.setUseRegion({value});
            }
          },

          getUsage100: function() {
              const f = 100 * this.getLevelStorageUsage / 48000000;
              if (f < 0.01) {
                return 0;
              } else {
                return Math.ceil(f);
              }
          }
        },

        methods: {
            ...levelActions({
              shiftGrid: LEVEL_ACTIONS.SHIFT_GRID,
              shiftRegion: LEVEL_ACTIONS.SHIFT_REGION,
            }),

            ...editorMutations({
                setUseRegion: EDITOR_MUTATIONS.UTILPANEL_SET_USE_REGION,
                somethingHasChanged: EDITOR_MUTATIONS.SOMETHING_HAS_CHANGED
            }),

            doChanged: function () {
                this.somethingHasChanged({value: true});
            },

            doShiftGrid: function (direction) {
                if (this.getUtilPanelUseRegion) {
                  this.shiftRegion({direction});
                } else {
                  this.shiftGrid({direction});
                }
                this.doChanged();
            }
        }
    }
</script>

<style scoped>
    .shiftpad table {
        margin: auto;
        background-color: #AAA;
    }
</style>