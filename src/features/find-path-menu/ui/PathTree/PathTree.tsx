import React, { useMemo } from "react";

import { PathTreeProps } from "./PathTree.interface";
import { Steps } from "antd";

export const PathTree: React.FC<PathTreeProps> = ({ housesMap, path }) => {
	const items = useMemo(() => {
		return path.map(node => {
			return {
				title: housesMap.get(node.id)?.address
			};
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [path]);

	return (
		<Steps
			direction="vertical"
			items={items}
		/>
	);
};
