import { ArrowData } from '@leafer-in/arrow';
import { POLYLINE_DEFAULT_EDIT_CONFIG } from '../../constant';
import type { IEditorConfig } from '@leafer-ui/interface';
import type { IPolylineData } from '../../type';

export class PolylineData extends ArrowData implements IPolylineData {
  protected _editConfig: IEditorConfig;

  set editConfig (value: IEditorConfig) {
    this._editConfig = { ...POLYLINE_DEFAULT_EDIT_CONFIG, ...value };
  }
}