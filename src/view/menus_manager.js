export class Menu {
    static Main = new Menu(0)
    static Edit = new Menu(1);
    static Simulation = new Menu(2);

    constructor(id) {
        this.id = id;
    }
}

export class MenusManager {
    static currentMenu = Menu.Main;

    static mainStage = null;
    static editStage = null;
    static simulationStage = null;

    static currentLevelId = -1;
    static currentLevel = null;

    static init(mainStage, editStage, simulationStage, levels) {
        this.mainStage = mainStage;
        this.editStage = editStage;
        this.simulationStage = simulationStage;
        this.levels = levels;
        this.refreshViews();
    }

    static setMenu(menu, refresh = true) {
        if(!(menu instanceof Menu))
            throw new Error("'menu' parameter must be of type 'Menu'");

        this.currentMenu = menu;
        if(refresh)
            this.refreshViews();
    }

    static refreshViews() {
        document.getElementById("main-menu").hidden = 
            this.currentMenu != Menu.Main;
        document.getElementById("edit-menu").hidden = 
            this.currentMenu != Menu.Edit;
        document.getElementById("simulation-menu").hidden = 
            this.currentMenu != Menu.Simulation;

        document.getElementById("konva-main-container").hidden = 
            this.currentMenu != Menu.Main;
        document.getElementById("konva-edit-container").hidden = 
            this.currentMenu != Menu.Edit;
        document.getElementById("konva-simulation-container").hidden = 
            this.currentMenu != Menu.Simulation;
    }

    static startLevel(levelId) {
        this.currentLevelId = levelId;
        this.currentLevel = this.levels[levelId];

        this.setMenu(Menu.Edit);
        this.refreshLevelUI();
    }

    static cancelLevel() {
        this.currentLevelId = -1;
        this.currentLevel = null;
    }

    static refreshLevelUI() {
        document.getElementById("level-title").innerHTML = "Level " +
            (this.currentLevelId + 1);
        document.getElementById("level-description").innerHTML =
            this.currentLevel.description;
    }
}