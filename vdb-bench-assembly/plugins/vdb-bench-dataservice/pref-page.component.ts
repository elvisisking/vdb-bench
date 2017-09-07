@Component({
    selector: 'pref-page',
    templateUrl: 'pref-page.component.html',
    styleUrls: ['pref-page.component.css']
})
export class PrefPageComponent {

	private names: string[];
	private pref: string;
	private $scope: IUserControllerScope;

    constructor( $scope: IUserControllerScope,
                 preferencesRegistry: PreferencesRegistry ) {
        this.$scope = $scope;
        
        let panels = preferencesRegistry.getTabs();
        this.names = sortNames(_.keys(this.panels));

	    //
	    // Select the first tab in the list-style
	    //
	    if (! _.isEmpty(this.names)) {
	        setPanel(this.names[0]);
	    }
    }

    exitPreferences() {
        this.$scope.vmmain.selectPage(this.$scope.vmmain.previousPageId());
    }

    setPanel(name) {
        this.pref = name;
    }

    hasPanel() {
        return ! _.isEmpty(this.pref);
    }

    active(name) {
        if (name === this.pref) {
            return 'active';
        }
        return '';
    }

    getPrefs(pref) {
        let panel = this.panels[pref];
        if (panel) {
            return panel.template;
        }
        return undefined;
    }

    /**
     * Sort the preference by names (and ensure Reset is last).
     * @param names  the names
     * @returns {any} the sorted names
     */
    sortNames(names) {
    	return names.sort( ( a, b ) => 0 - ( a.localeCompare( b ) ? 1 : -1 ) );
    }

}