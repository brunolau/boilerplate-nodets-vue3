import { and, eq, gt, inArray, like, lt, ne, or, sql } from "drizzle-orm"
import { DbQueryable } from "src/db/drizzle/drizzle-eftify/queryable/db-queryable"
import ObjectUtils from "./object-utils"

export interface PaginatedRequest {
    pageSize?: number
    page?: number
    filter?: PaginatedFilterDefinition
}

interface PaginationUtilApplyFilterArgs {
    filter: PaginatedFilterDefinition,
    fullTextColumns: string[]
}

export interface PaginatedFilterDefinition {
    FullText: string
    FilterItems: PaginatedPostBackFilterItem[]
}

export interface PaginatedOnSortedArgs {
    oldIndex: number
    newIndex: number
}

export interface PaginatedPostBackFilterItem {
    PropertyName: string
    ContainsValue?: string
    EqualsValue?: string
    NumFrom?: number
    NumTo?: number
    DateFrom?: string
    DateTo?: string
    ValueArr?: string[]
	ParseValue?: (value: string) => any
}

export default class PaginationUtil {
    static applyFilter<T>(query: DbQueryable<T>, filterArgs: PaginationUtilApplyFilterArgs): DbQueryable<T> {
        if (filterArgs?.filter == null) {
            return query;
        }

        const { filter } = filterArgs;
        if (filter.FullText) {
            query = query.where(p => or(...filterArgs.fullTextColumns.map((colName) => like((p as any)[colName], `%${filter.FullText}%`))))
        }

        if (filter.FilterItems != null) {
            for (const filterItem of filter.FilterItems) {
                if (filterItem.ContainsValue?.length > 0) {
                    query = query.where(p => {
                        const filterProp = (p as any)[filterItem.PropertyName];
                        if (filterProp == null) {
                            return ne(sql`1` as any, 2);
                        }

                        if (filterProp.dataType == 'string') {
                            return like(sql`lower(${filterProp})` as any, `%${filterItem.ContainsValue?.toLowerCase()}%`)
                        } else {
                            return like(sql`${filterProp}::varchar(255)` as any, `%${filterItem.ContainsValue?.toLowerCase()}%`)
                        }
                    });
                } else if (filterItem.EqualsValue?.length > 0) {
                    query = query.where(p => eq((p as any)[filterItem.PropertyName], filterItem.ContainsValue));
                } else if (filterItem.ValueArr?.length > 0) {
                    query = query.where(p => inArray((p as any)[filterItem.PropertyName], filterItem.ValueArr));
                } else if (filterItem.DateFrom != null) {
                    if (filterItem.DateTo != null) {
                        query = query.where(p => and(gt((p as any)[filterItem.PropertyName], new Date(filterItem.DateFrom)), lt((p as any)[filterItem.PropertyName], new Date(filterItem.DateTo))));
                    } else {
                        query = query.where(p => gt((p as any)[filterItem.PropertyName], new Date(filterItem.DateFrom)));
                    }
                } else if (filterItem.DateTo != null) {
                    query = query.where(p => lt((p as any)[filterItem.PropertyName], new Date(filterItem.DateTo)));
                }
            }
        }

        return query;
    }

	static applyOfflineFilter<T extends Record<string, any>>(items: T[], filterArgs: PaginationUtilApplyFilterArgs): T[] {
		if (filterArgs?.filter == null) {
			return items;
		}

		const { filter } = filterArgs;
		if (filter.FullText) {
			items = items.filter((item) => filter.FullText.split(' ').every((word) => filterArgs.fullTextColumns.some((colName) => (item[colName] || '').toLowerCase().includes(word.toLowerCase()))));
		}

		if (filter.FilterItems != null) {
			for (const filterItem of filter.FilterItems) {
				if (filterItem.ContainsValue?.length > 0) {
					const value = filterItem.ParseValue ? filterItem.ParseValue(filterItem.ContainsValue) : filterItem.ContainsValue;
					items = items.filter((item) => (item[filterItem.PropertyName] || '').toLowerCase().includes(value.toLowerCase()));
				} else if (filterItem.EqualsValue?.length > 0) {
					const value = filterItem.ParseValue ? filterItem.ParseValue(filterItem.EqualsValue) : filterItem.EqualsValue;
					items = items.filter((item) => {
						if (ObjectUtils.isObject(item[filterItem.PropertyName])) {
							return ObjectUtils.deepEqual(item[filterItem.PropertyName], value);
						}

						return item[filterItem.PropertyName] === value
					});
				} else if (filterItem.ValueArr?.length > 0) {
					const value = filterItem.ParseValue ? filterItem.ValueArr.map(filterItem.ParseValue) : filterItem.ValueArr;
					items = items.filter((item) => value.includes(item[filterItem.PropertyName]));
				} else if (filterItem.DateFrom != null) {
					if (filterItem.DateTo != null) {
						items = items.filter((item) => new Date(item[filterItem.PropertyName]) >= new Date(filterItem.DateFrom) && new Date(item[filterItem.PropertyName]) <= new Date(filterItem.DateTo));
					} else {
						items = items.filter((item) => new Date(item[filterItem.PropertyName]) >= new Date(filterItem.DateFrom));
					}
				} else if (filterItem.DateTo != null) {
					items = items.filter((item) => new Date(item[filterItem.PropertyName]) <= new Date(filterItem.DateTo));
				}
			}
		}

		return items;
	}
}
