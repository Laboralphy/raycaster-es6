<template>
    <StatusBar>
        <MyButton @click="goHome"><HomeIcon decorative></HomeIcon></MyButton>
        <span v-if="getUserAuth">[<b>{{ getUserName }}</b>]</span>
        <SimpleMenu :routes="routes.main"></SimpleMenu>
        <SimpleMenu style="float: right" :routes="routes.tools"></SimpleMenu>
    </StatusBar>
</template>

<script>
    import {createNamespacedHelpers} from 'vuex';

    import StatusBar from "./StatusBar.vue";
    import MyButton from "./MyButton.vue";
    import SimpleMenu from "./SimpleMenu.vue";

    // icons
    import GridIcon from "vue-material-design-icons/Grid.vue";
    import FolderMultipleImageIcon from "vue-material-design-icons/FolderMultipleImage.vue";
    import AnimationIcon from "vue-material-design-icons/Animation.vue";
    import TextureIcon from "vue-material-design-icons/Texture.vue";
    import TagIcon from "vue-material-design-icons/Tag.vue";
    import ChessRookIcon from "vue-material-design-icons/ChessRook.vue";
    import ShapeIcon from "vue-material-design-icons/Shape.vue";
    import WeatherFogIcon from "vue-material-design-icons/WeatherFog.vue";
    import GamepadVariantIcon from "vue-material-design-icons/GamepadVariant.vue";
    import SettingsIcon from "vue-material-design-icons/Settings.vue";
    import InformationIcon from "vue-material-design-icons/Information.vue"
    import ToolboxIcon from "vue-material-design-icons/Toolbox.vue";
    import HomeIcon from "vue-material-design-icons/Home.vue"

    const {mapGetters: editorGetters} = createNamespacedHelpers('editor');

    export default {
        name: "MainMenu",
        components: {
            SimpleMenu,
            AnimationIcon,
            FolderMultipleImageIcon,
            GridIcon,
            MyButton,
            StatusBar,
            TextureIcon,
            TagIcon,
            ChessRookIcon,
            ShapeIcon,
            WeatherFogIcon,
            SettingsIcon,
            ToolboxIcon,
            GamepadVariantIcon,
            InformationIcon,
            HomeIcon
        },

        computed: {
            ...editorGetters(['getUserAuth', 'getUserName'])
        },

        data: function() {
            return {
                routes: {
                    main: [
                        {
                            icon: GridIcon,
                            route: '/level/blocks',
                            highlight: /^\/level\//,
                            caption: 'Level',
                            title: 'Level editor'
                        },
                        {
                            icon: FolderMultipleImageIcon,
                            route: '/load-tiles',
                            caption: 'Tiles',
                            title: 'Load tileset and import wall and flat tiles'
                        },
                        {
                            icon: AnimationIcon,
                            route: '/build-anim',
                            caption: 'Anim.',
                            title: 'Make animated textures'
                        },
                        {
                            icon: WeatherFogIcon,
                            route: '/setup-ambiance',
                            caption: 'Ambiance',
                            title: 'Setup fog, brightness, and background image'
                        },
                        {
                            icon: GamepadVariantIcon,
                            route: '/render',
                            caption: 'Render',
                            title: 'Load the level into the raycasting engine'
                        },
                        {
                            icon: SettingsIcon,
                            route: '/settings',
                            caption: 'Settings',
                            title: 'Go to settings panel. Configure tile size and rendering flags'
                        },
                        {
                            icon: InformationIcon,
                            route: '/',
                            caption: 'About',
                            title: 'About this application (title only)'
                        }
                    ],
                    tools: [
                        {
                            icon: TextureIcon,
                            route: '/level/blocks',
                            highlight: /^\/level\/block/,
                            caption: 'Blocks',
                            title: 'Display the block browser'
                        },
                        {
                            icon: TagIcon,
                            route: '/level/tags',
                            caption: 'Tags',
                            title: 'Put tags on the map to add some in-game behavior'
                        },
                        {
                            icon: ShapeIcon,
                            route: '/level/marks',
                            caption: 'Marks',
                            title: 'Put visual marks on the map'
                        },
                        {
                            icon: ChessRookIcon,
                            route: '/level/things',
                            highlight: /^\/level\/things/,
                            caption: 'Things',
                            title: 'Place sprites on the map'
                        },
                        {
                            icon: ToolboxIcon,
                            route: '/level/utilpanel',
                            highlight: /^\/level\/utilpanel/,
                            caption: 'Util.',
                            title: 'Various tools and utilities'
                        }
                    ]
                },
            }
        },

        methods: {
            goHome: function() {
                if (confirm('You are about to LEAVE the Map Editor, make sure you have saved all your work before leaving.\n(Press "Cancel" to stay in the Map Editor).')) {
                    window.location.href = '/';
                }
            }
        }

    }
</script>

<style scoped>

</style>