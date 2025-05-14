import React from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';

const CustomEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
  label
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path transition-all duration-300"
        d={edgePath}
        markerEnd={markerEnd}
      />
      {label && (
        <text>
          <textPath
            href={`#${id}`}
            style={{ fill: 'white', fontWeight: 500 }}
            startOffset="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-xs bg-opacity-70 px-1 py-0.5 rounded"
          >
            <tspan dy={-10} className="bg-black bg-opacity-70 px-1 py-0.5 rounded">{label}</tspan>
          </textPath>
        </text>
      )}
    </>
  );
};

export default CustomEdge;