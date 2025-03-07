import React from "react";
import { MaterialProps } from ".";
import { Badge, Card, Flex, Tag, Typography } from "antd";
import { MaterialRecord } from "./record";
import { css } from "@emotion/css";
import { Canvas, useEditor } from "@craftjs/core";
import { SmileOutlined } from "@ant-design/icons";
import _ from "lodash";

export interface MaterialGroupProps {
  groupName: string;
  groupList: MaterialProps["components"];
  description?: string;
}

const classes = {
  group: css({
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 12,
    overflow: "auto",
    height: "100%",
  }),
};

export const MaterialGroup: React.FC<MaterialGroupProps> = (props) => {
  const { connectors, actions } = useEditor();

  const isEmpty = Object.keys(props.groupList).length === 0;

  if (isEmpty) {
    return null;
  }

  return (
    <Flex vertical gap={12}>
      <Flex justify="flex-start" gap={6}>
        <Typography.Text type="secondary">{props.groupName}</Typography.Text>
        {isEmpty ? null : (
          <Tag color="blue" bordered={false}>
            {Object.keys(props.groupList).length}
          </Tag>
        )}
      </Flex>
      <div className={classes.group}>
				{
					/**
					 * value:对象的value，也就是Module=MaterialComponent
						key:对象的key
					 */
				}
        {_.map(props.groupList, (value, key: string) => {
					console.log('value', value)
          const displayName = value.craft?.displayName;
          const { icon } = value.craft.related || {};
          const { useCanvas = false } = value.craft?.custom || {};
          return (
            <MaterialRecord
              key={key}
              ref={(ref: HTMLDivElement) => {
								// 给组件卡片支持拖拽的功能
                if (ref) {
                  connectors.create(
                    ref,
                    useCanvas ? (
											// Canvas = <Element canvas is={value} />
                      <Canvas canvas is={value} />
                    ) : (
                      React.createElement(value)
                    ), {
                      onCreate: (nodeTee) => {
                        console.log('nodeTree拖拽结束', nodeTee)
                        actions.selectNode(nodeTee.rootNodeId);
                      },
                    }
                  );
                }
              }}
              name={displayName}
              icon={icon ? React.createElement(icon) : <SmileOutlined />}
            />
          );
        })}
      </div>
    </Flex>
  );
};
