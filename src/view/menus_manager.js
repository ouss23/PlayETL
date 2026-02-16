export class Menu {
    static Edit = new Menu(0);
    static Simulation = new Menu(1);

    constructor(id) {
        this.id = id;
    }
}

export class MenusManager {
    static currentMenu = Menu.Edit;

    static editStage = null;
    static simulationStage = null;

    static init(editStage, simulationStage) {
        this.editStage = editStage;
        this.simulationStage = simulationStage;
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
        document.getElementById("edit-menu").hidden = 
            this.currentMenu != Menu.Edit;
        document.getElementById("simulation-menu").hidden = 
            this.currentMenu != Menu.Simulation;

        document.getElementById("konva-edit-container").hidden = 
            this.currentMenu != Menu.Edit;
        document.getElementById("konva-simulation-container").hidden = 
            this.currentMenu != Menu.Simulation;
    }
}