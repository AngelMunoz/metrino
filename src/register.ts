import { registerMetroButton } from "./components/buttons/button.ts";
import { registerMetroDropdownButton } from "./components/buttons/dropdown-button.ts";
import { registerMetroHyperlinkButton } from "./components/buttons/hyperlink-button.ts";
import { registerMetroRepeatButton } from "./components/buttons/repeat-button.ts";

import { registerMetroCalendar } from "./components/datetime/calendar.ts";
import { registerMetroCalendarDatePicker } from "./components/datetime/calendar-date-picker.ts";
import { registerMetroDatePicker } from "./components/datetime/date-picker.ts";
import { registerMetroDatePickerRoller } from "./components/datetime/date-picker-roller.ts";
import { registerMetroTimePicker } from "./components/datetime/time-picker.ts";
import { registerMetroTimePickerRoller } from "./components/datetime/time-picker-roller.ts";

import { registerMetroContentDialog } from "./components/dialogs/content-dialog.ts";
import { registerMetroFlyout } from "./components/dialogs/flyout.ts";
import { registerMetroMessageDialog } from "./components/dialogs/message-dialog.ts";
import { registerMetroSettingsFlyout } from "./components/dialogs/settings-flyout.ts";

import { registerMetroAutoSuggestBox } from "./components/input/auto-suggest-box.ts";
import { registerMetroCheckBox } from "./components/input/check-box.ts";
import { registerMetroComboBox } from "./components/input/combo-box.ts";
import { registerMetroNumberBox } from "./components/input/number-box.ts";
import { registerMetroPasswordBox } from "./components/input/password-box.ts";
import { registerMetroRadioButton } from "./components/input/radio-button.ts";
import { registerMetroRating } from "./components/input/rating.ts";
import { registerMetroRichEditBox } from "./components/input/rich-edit-box.ts";
import { registerMetroSlider } from "./components/input/slider.ts";
import { registerMetroTextBox } from "./components/input/text-box.ts";
import { registerMetroToggleSwitch } from "./components/input/toggle-switch.ts";

import { registerMetroCanvas } from "./components/layout/canvas.ts";
import { registerMetroGrid } from "./components/layout/grid.ts";
import { registerMetroScrollViewer } from "./components/layout/scroll-viewer.ts";
import { registerMetroStackPanel } from "./components/layout/stack-panel.ts";
import { registerMetroTileGrid } from "./components/layout/tile-grid.ts";
import { registerMetroVariableSizedWrapGrid } from "./components/layout/variable-sized-wrap-grid.ts";
import { registerMetroViewbox } from "./components/layout/viewbox.ts";
import { registerMetroWrapPanel } from "./components/layout/wrap-panel.ts";

import { registerMetroAppBar } from "./components/navigation/app-bar.ts";
import { registerMetroAppBarButton } from "./components/navigation/app-bar-button.ts";
import { registerMetroAppBarSeparator } from "./components/navigation/app-bar-separator.ts";
import { registerMetroAppBarToggleButton } from "./components/navigation/app-bar-toggle-button.ts";
import { registerMetroHub } from "./components/navigation/hub.ts";
import { registerMetroHubSection } from "./components/navigation/hub-section.ts";
import { registerMetroPanorama } from "./components/navigation/panorama.ts";
import { registerMetroPanoramaItem } from "./components/navigation/panorama-item.ts";
import { registerMetroPivot } from "./components/navigation/pivot.ts";
import { registerMetroPivotItem } from "./components/navigation/pivot-item.ts";
import { registerMetroSplitView } from "./components/navigation/split-view.ts";

import { registerMetroBorder } from "./components/primitives/border.ts";
import { registerMetroContextMenu } from "./components/primitives/context-menu.ts";
import { registerMetroExpander } from "./components/primitives/expander.ts";
import { registerMetroIcon } from "./components/primitives/icon.ts";
import { registerMetroImage } from "./components/primitives/image.ts";
import { registerMetroInfoBar } from "./components/primitives/info-bar.ts";
import { registerMetroMediaElement } from "./components/primitives/media-element.ts";
import { registerMetroMenuFlyout } from "./components/primitives/menu-flyout.ts";
import { registerMetroPersonPicture } from "./components/primitives/person-picture.ts";
import { registerMetroRichTextBlock } from "./components/primitives/rich-text-block.ts";
import { registerMetroTextBlock } from "./components/primitives/text-block.ts";
import { registerMetroToast } from "./components/primitives/toast.ts";
import { registerMetroTooltip } from "./components/primitives/tooltip.ts";

import { registerMetroProgressBar } from "./components/progress/progress-bar.ts";
import { registerMetroProgressRing } from "./components/progress/progress-ring.ts";

import { registerMetroFlipView } from "./components/selection/flip-view.ts";
import { registerMetroGridView } from "./components/selection/grid-view.ts";
import { registerMetroListBox } from "./components/selection/list-box.ts";
import { registerMetroListPicker } from "./components/selection/list-picker.ts";
import { registerMetroListView } from "./components/selection/list-view.ts";
import { registerMetroLongListSelector } from "./components/selection/long-list-selector.ts";
import { registerMetroSemanticZoom } from "./components/selection/semantic-zoom.ts";
import { registerMetroTreeView } from "./components/selection/tree-view.ts";

import { registerMetroCycleTile } from "./components/tiles/cycle-tile.ts";
import { registerMetroFlipTile } from "./components/tiles/flip-tile.ts";
import { registerMetroIconicTile } from "./components/tiles/iconic-tile.ts";
import { registerMetroLiveTile } from "./components/tiles/live-tile.ts";

export function registerButtons(): void {
  registerMetroButton();
  registerMetroDropdownButton();
  registerMetroHyperlinkButton();
  registerMetroRepeatButton();
}

export function registerDatetime(): void {
  registerMetroCalendar();
  registerMetroCalendarDatePicker();
  registerMetroDatePicker();
  registerMetroDatePickerRoller();
  registerMetroTimePicker();
  registerMetroTimePickerRoller();
}

export function registerDialogs(): void {
  registerMetroContentDialog();
  registerMetroFlyout();
  registerMetroMessageDialog();
  registerMetroSettingsFlyout();
}

export function registerInputs(): void {
  registerMetroAutoSuggestBox();
  registerMetroCheckBox();
  registerMetroComboBox();
  registerMetroNumberBox();
  registerMetroPasswordBox();
  registerMetroRadioButton();
  registerMetroRating();
  registerMetroRichEditBox();
  registerMetroSlider();
  registerMetroTextBox();
  registerMetroToggleSwitch();
}

export function registerLayout(): void {
  registerMetroCanvas();
  registerMetroGrid();
  registerMetroScrollViewer();
  registerMetroStackPanel();
  registerMetroTileGrid();
  registerMetroVariableSizedWrapGrid();
  registerMetroViewbox();
  registerMetroWrapPanel();
}

export function registerNavigation(): void {
  registerMetroAppBar();
  registerMetroAppBarButton();
  registerMetroAppBarSeparator();
  registerMetroAppBarToggleButton();
  registerMetroHub();
  registerMetroHubSection();
  registerMetroPanorama();
  registerMetroPanoramaItem();
  registerMetroPivot();
  registerMetroPivotItem();
  registerMetroSplitView();
}

export function registerPrimitives(): void {
  registerMetroBorder();
  registerMetroContextMenu();
  registerMetroExpander();
  registerMetroIcon();
  registerMetroImage();
  registerMetroInfoBar();
  registerMetroMediaElement();
  registerMetroMenuFlyout();
  registerMetroPersonPicture();
  registerMetroRichTextBlock();
  registerMetroTextBlock();
  registerMetroToast();
  registerMetroTooltip();
}

export function registerProgress(): void {
  registerMetroProgressBar();
  registerMetroProgressRing();
}

export function registerSelection(): void {
  registerMetroFlipView();
  registerMetroGridView();
  registerMetroListBox();
  registerMetroListPicker();
  registerMetroListView();
  registerMetroLongListSelector();
  registerMetroSemanticZoom();
  registerMetroTreeView();
}

export function registerTiles(): void {
  registerMetroCycleTile();
  registerMetroFlipTile();
  registerMetroIconicTile();
  registerMetroLiveTile();
}

export function registerAllComponents(): void {
  registerButtons();
  registerDatetime();
  registerDialogs();
  registerInputs();
  registerLayout();
  registerNavigation();
  registerPrimitives();
  registerProgress();
  registerSelection();
  registerTiles();
}
