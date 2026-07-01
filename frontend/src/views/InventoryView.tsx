import React from "react";
import { useInventory } from "../hooks/useInventory";
import { WeaponCard } from "../components/molecules/WeaponCard";
import { CardSorter } from "../components/organisms/CardSorter";
import LoadingSpinner from "../components/atoms/LoadingSpinner";

const InventoryView: React.FC = () => {
  const { weapons, loading } = useInventory();

  if (loading) {
    return <LoadingSpinner label="Synchronizing Arsenal..." />;
  }

  return (
    <CardSorter items={weapons}>
      {(filteredWeapons) => (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-6">
          {filteredWeapons.map((weapon) => (
            <WeaponCard
              key={weapon.id}
              weapon={weapon}
              isDraggable={false}
              isFlippable={true}
              backContent={
                <div className="text-center">
                  <h3 className="text-white font-bold mb-2">{weapon.name}</h3>
                  <p className="text-xs text-gray-400">{weapon.description}</p>
                </div>
              }
            />
          ))}
        </div>
      )}
    </CardSorter>
  );
};

export default InventoryView;
