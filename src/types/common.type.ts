export type FindAllResponse<T> = { count: number; items: T[] };

export type SortParams = {
	column: string;
	isAscending: boolean;
};

export type FilterParams = {
	column: string;
	value: string | number | boolean;
	filterOperator: number;
};

export type SearchParams = {
	value: string;
};

export type QueryParams = {
	page: number;
	limit: number;
	sort: SortParams[];
	filter: FilterParams[];
	globalFilter: SearchParams;
};
