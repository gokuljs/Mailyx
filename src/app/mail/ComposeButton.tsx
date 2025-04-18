import React, { useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Feather, PencilIcon } from "lucide-react";
import EmailEditor from "./EmailEditor";

type Props = {};

const ComposeButton = (props: Props) => {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [toValues, setToValues] = useState<{ label: string; value: string }[]>(
    [],
  );
  const [ccValue, setCCValues] = useState<{ label: string; value: string }[]>(
    [],
  );

  const handleSend = () => {
    console.log("handle send");
  };
  return (
    <Drawer
      open={open}
      onOpenChange={() => {
        setOpen(false);
      }}
    >
      <Button className="cursor-pointer" onClick={() => setOpen(true)}>
        <Feather />
        Compose
      </Button>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Compose Email</DrawerTitle>
        </DrawerHeader>
        <EmailEditor
          subject={subject}
          toValues={toValues}
          setToValues={setToValues}
          setSubject={setSubject}
          ccValues={ccValue}
          to={toValues?.map((item) => item?.value)}
          defaultToolbarExpanded={true}
          setCCValues={setCCValues}
          handleSend={handleSend}
          isSending={false}
        />
      </DrawerContent>
    </Drawer>
  );
};

export default ComposeButton;
