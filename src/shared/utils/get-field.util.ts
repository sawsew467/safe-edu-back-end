import * as lodash from 'lodash';
export function getField(obj: any, field: string[]) {
  return lodash.pick(obj, field);
}
