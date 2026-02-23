import React, { useCallback, useEffect, useRef } from 'react';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  Controls,
  MiniMap,
  MarkerType,
} from 'reactflow';
import type { Connection, Edge, Node } from 'reactflow';
import 'reactflow/dist/style.css';
import { FamilyNode } from './FamilyNode';
import type { Pessoa } from '../../../types/budget';

interface InteractiveFamilyTreeProps {
  pessoas: Pessoa[];
  onRemovePessoa: (id: string) => void;
  onUpdatePessoa: (id: string, field: string, value: any) => void;
}

const initialEdges: Edge[] = [];
const nodeTypes = { familyNode: FamilyNode };

export function InteractiveFamilyTree({ pessoas, onRemovePessoa, onUpdatePessoa }: InteractiveFamilyTreeProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const onRemoveRef = useRef(onRemovePessoa);
  const onUpdateRef = useRef(onUpdatePessoa);

  useEffect(() => {
    onRemoveRef.current = onRemovePessoa;
    onUpdateRef.current = onUpdatePessoa;
  }, [onRemovePessoa, onUpdatePessoa]);

  // Sync nodes with 'pessoas' prop, preserving positions
  useEffect(() => {
    setNodes((currentNodes) => {
      const newNodes: Node[] = pessoas.map((pessoa, index) => {
        // Check if node already exists to preserve position
        const existingNode = currentNodes.find((n) => n.id === pessoa.id);
        
        // Default position logic (simple vertical stack if new)
        const defaultX = 250;
        const defaultY = index * 150 + 50;

        return {
          id: pessoa.id,
          type: 'familyNode',
          position: existingNode ? existingNode.position : { x: defaultX, y: defaultY },
          data: { 
            pessoa, 
            onRemove: (id: string) => onRemoveRef.current(id),
            onUpdate: (id: string, field: string, value: any) => onUpdateRef.current(id, field, value),
          },
          draggable: true,
          connectable: true,
        };
      });
      return newNodes;
    });
  }, [pessoas, setNodes]);

  // Handle connections
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ 
      ...params, 
      type: 'smoothstep', 
      animated: true,
      style: { stroke: '#003366', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#003366' },
    }, eds)),
    [setEdges]
  );

  return (
    <div className="w-full h-[600px] bg-gray-50 rounded-xl border border-gray-200 shadow-inner overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
      >
        <Background color="#ccc" gap={20} size={1} />
        <Controls />
        <MiniMap 
          nodeColor={(n) => {
            if (n.data.pessoa.grauParentesco === 'Dante Causa') return '#003366';
            return '#e5e7eb';
          }}
          maskColor="rgba(240, 240, 240, 0.6)"
        />
      </ReactFlow>
      
      <div className="absolute top-4 right-4 bg-white/90 p-3 rounded-lg shadow-sm border border-gray-200 text-xs text-gray-500 max-w-[200px] pointer-events-none z-10">
        <p className="font-medium text-gray-800 mb-1">Dica:</p>
        <p>Arraste os cards para organizar.</p>
        <p>Conecte os pontos (bolinhas) para criar linhas de parentesco.</p>
      </div>
    </div>
  );
}
