import React, { useRef } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import ServiceKpiCard from './ServiceKpiCard';
import { mockServiceKpis } from '../../utils/mockData';
const ServiceKpiScrollContainer: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -300,
        behavior: 'smooth'
      });
    }
  };
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 300,
        behavior: 'smooth'
      });
    }
  };
  return <div className="relative">
      <h2 className="text-lg font-medium text-gray-800 mb-4">
        Indicadores Por Servicio
      </h2>
      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -ml-4 z-10">
        <button className="bg-white rounded-full p-1 shadow-md" onClick={scrollLeft}>
          <ChevronLeftIcon className="h-5 w-5 text-gray-500" />
        </button>
      </div>
      <div ref={scrollContainerRef} className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide" style={{
      scrollbarWidth: 'none',
      msOverflowStyle: 'none'
    }}>
        {mockServiceKpis.map(service => <ServiceKpiCard key={service.id} name={service.name} status={service.status as 'active' | 'paused' | 'suspended' | 'trial'} gmv={service.gmv} gmvPercentage={service.gmvPercentage} usage={service.usage} quota={service.quota} keyMetric={service.keyMetric} secondaryMetric={service.secondaryMetric} />)}
      </div>
      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 -mr-4 z-10">
        <button className="bg-white rounded-full p-1 shadow-md" onClick={scrollRight}>
          <ChevronRightIcon className="h-5 w-5 text-gray-500" />
        </button>
      </div>
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>;
};
export default ServiceKpiScrollContainer;